-- Phase 8: Guest Experience (P2)
-- 8.1 CRM, 8.2 Loyalty, 8.3 Reservations/Tables, 8.4 KDS, 8.5 Feedback

-- ═══════════════════════════════════════════════════════════════
-- 8.1 Guest Profiles + CRM
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.guest_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  notes text,
  tags jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_restaurant ON public.guest_profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_email ON public.guest_profiles(email);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_phone ON public.guest_profiles(phone);

CREATE TABLE IF NOT EXISTS public.guest_visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_profile_id uuid NOT NULL REFERENCES public.guest_profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  party_size integer NOT NULL DEFAULT 1,
  total_spent numeric(10,2),
  source text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_guest_visits_profile ON public.guest_visits(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_guest_visits_restaurant ON public.guest_visits(restaurant_id);

-- ═══════════════════════════════════════════════════════════════
-- 8.2 Loyalty
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_profile_id uuid NOT NULL REFERENCES public.guest_profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  points_balance integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_accounts_guest ON public.loyalty_accounts(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_restaurant ON public.loyalty_accounts(restaurant_id);

CREATE TABLE IF NOT EXISTS public.loyalty_points_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  loyalty_account_id uuid NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  points integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'adjust', 'expire')),
  reference_type text,
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_account ON public.loyalty_points_transactions(loyalty_account_id);

CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  points_required integer NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('discount', 'free_item', 'fixed_amount', 'percent_off')),
  reward_value numeric(10,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_restaurant ON public.loyalty_rewards(restaurant_id);

-- ═══════════════════════════════════════════════════════════════
-- 8.3 Reservations + Tables + Floor Plans
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.floor_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  layout_data jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_floor_plans_restaurant ON public.floor_plans(restaurant_id);

CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  floor_plan_id uuid REFERENCES public.floor_plans(id) ON DELETE SET NULL,
  table_number text NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  section text,
  position_x numeric(6,2),
  position_y numeric(6,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant ON public.restaurant_tables(restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_tables_number ON public.restaurant_tables(restaurant_id, table_number);

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  guest_profile_id uuid REFERENCES public.guest_profiles(id) ON DELETE SET NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  party_size integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  special_requests text,
  source text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON public.reservations(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

CREATE TABLE IF NOT EXISTS public.reservation_tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reservation_tables_reservation ON public.reservation_tables(reservation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_tables_unique ON public.reservation_tables(reservation_id, table_id);

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  phone text,
  party_size integer NOT NULL DEFAULT 1,
  estimated_wait_minutes integer,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'seated', 'cancelled')),
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_restaurant ON public.waitlist_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist_entries(status);

-- ═══════════════════════════════════════════════════════════════
-- 8.4 KDS Foundation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.kds_stations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  station_type text NOT NULL DEFAULT 'main' CHECK (station_type IN ('main', 'expedite', 'prep')),
  printer_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_kds_stations_restaurant ON public.kds_stations(restaurant_id);

CREATE TABLE IF NOT EXISTS public.kitchen_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  ticket_number text NOT NULL,
  guest_name text,
  table_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'served', 'cancelled')),
  priority integer NOT NULL DEFAULT 0,
  pos_transaction_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_restaurant ON public.kitchen_tickets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_status ON public.kitchen_tickets(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kitchen_tickets_number ON public.kitchen_tickets(restaurant_id, ticket_number);

CREATE TABLE IF NOT EXISTS public.ticket_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id uuid NOT NULL REFERENCES public.kitchen_tickets(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  modifiers jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'prepping', 'done')),
  station_id uuid REFERENCES public.kds_stations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ticket_items_ticket ON public.ticket_items(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_items_station ON public.ticket_items(station_id);

CREATE TABLE IF NOT EXISTS public.ticket_routing (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_item_id uuid NOT NULL REFERENCES public.ticket_items(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.kds_stations(id) ON DELETE CASCADE,
  sequence_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ticket_routing_ticket_item ON public.ticket_routing(ticket_item_id);
CREATE INDEX IF NOT EXISTS idx_ticket_routing_station ON public.ticket_routing(station_id);

-- ═══════════════════════════════════════════════════════════════
-- 8.5 Guest Feedback & Surveys
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.guest_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  guest_profile_id uuid REFERENCES public.guest_profiles(id) ON DELETE SET NULL,
  visit_date date,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  category text CHECK (category IN ('food', 'service', 'ambiance', 'cleanliness', 'overall')),
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_restaurant ON public.guest_feedback(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_rating ON public.guest_feedback(rating);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  guest_profile_id uuid REFERENCES public.guest_profiles(id) ON DELETE SET NULL,
  survey_name text NOT NULL,
  question text NOT NULL,
  response text,
  response_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_restaurant ON public.survey_responses(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON public.survey_responses(survey_name);
