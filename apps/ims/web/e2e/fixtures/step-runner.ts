import { Page, expect, Locator } from '@playwright/test';

export type StepAction = 'goto' | 'type' | 'click' | 'checkUrl' | 'checkVisible' | 'checkHidden' | 'wait' | 'select' | 'pressKey';

export interface Step {
  action: StepAction;
  target?: string;
  value?: string;
}

export interface StepResult {
  step: Step;
  raw: string;
  passed: boolean;
  error?: string;
}

export type FieldMap = Record<string, string>;

const COMMON_FIELDS: FieldMap = {
  'email': 'input[type="email"], input[name="email"], input[id="email"]',
  'password': 'input[type="password"]',
  'continue button': 'button[type="submit"]',
  'submit': 'button[type="submit"]',
  'search': 'input[type="search"], input[placeholder*="search" i]',
  'name': 'input[name="name"], input[id="name"]',
  'description': 'textarea[name="description"], input[name="description"]',
};

const URL_PATTERNS = [
  /^(?:go to|navigate to|open)\s+(.+)$/i,
  /^(?:visit)\s+(.+)$/i,
];

const TYPE_PATTERNS = [
  /^(?:type|enter|fill)\s+(.+?)\s+as\s+(.+)$/i,
  /^(?:type|enter|fill)\s+(.+?)\s+with\s+(.+)$/i,
  /^(?:type|enter|fill)\s+(.+?)\s+=\s+(.+)$/i,
  /^(?:set)\s+(.+?)\s+to\s+(.+)$/i,
];

const CLICK_PATTERNS = [
  /^(?:click|press|tap)\s+(.+)$/i,
  /^(?:click on|press on|tap on)\s+(.+)$/i,
  /^(?:submit)\s+(.+)$/i,
];

const CHECK_URL_PATTERNS = [
  /^(?:check that the URL is|check URL is|verify URL is|verify the URL is)\s+(.+)$/i,
  /^(?:check that the url is|check url is|verify url is|verify the url is)\s+(.+)$/i,
  /^(?:url should be)\s+(.+)$/i,
];

const CHECK_VISIBLE_PATTERNS = [
  /^(?:check that|verify|check)\s+(.+?)\s+is visible$/i,
  /^(?:check that|verify|check)\s+(.+?)\s+(?:should be\s+)?visible$/i,
  /^(?:see|i should see)\s+(.+)$/i,
];

const CHECK_HIDDEN_PATTERNS = [
  /^(?:check that|verify|check)\s+(.+?)\s+is hidden$/i,
  /^(?:check that|verify|check)\s+(.+?)\s+(?:should be\s+)?hidden$/i,
  /^(?:i should not see)\s+(.+)$/i,
];

const WAIT_PATTERNS = [
  /^wait\s+(?:for\s+)?(\d+)\s*(?:seconds?|s|ms)?$/i,
  /^pause\s+(?:for\s+)?(\d+)\s*(?:seconds?|s|ms)?$/i,
];

const SELECT_PATTERNS = [
  /^select\s+(.+?)\s+from\s+(.+)$/i,
  /^choose\s+(.+?)\s+from\s+(.+)$/i,
  /^pick\s+(.+?)\s+in\s+(.+)$/i,
];

const PRESS_KEY_PATTERNS = [
  /^press\s+key\s+(.+)$/i,
  /^hit\s+(.+)$/i,
  /^press\s+(enter|escape|tab|backspace|arrow\w+)$/i,
];

function normalizeUrl(url: string): string {
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
  }
  return url;
}

export function parseStep(text: string): Step {
  const trimmed = text.trim();

  for (const pattern of URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'goto', value: normalizeUrl(match[1]) };
  }

  for (const pattern of TYPE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'type', target: match[1].trim(), value: match[2].trim() };
  }

  for (const pattern of CLICK_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'click', target: match[1].trim() };
  }

  for (const pattern of CHECK_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'checkUrl', value: normalizeUrl(match[1]) };
  }

  for (const pattern of CHECK_VISIBLE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'checkVisible', target: match[1].trim() };
  }

  for (const pattern of CHECK_HIDDEN_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'checkHidden', target: match[1].trim() };
  }

  for (const pattern of WAIT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      let ms = parseInt(match[1], 10);
      if (!trimmed.toLowerCase().includes('ms')) ms *= 1000;
      return { action: 'wait', value: String(ms) };
    }
  }

  for (const pattern of SELECT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'select', target: match[2].trim(), value: match[1].trim() };
  }

  for (const pattern of PRESS_KEY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { action: 'pressKey', target: match[1].trim() };
  }

  throw new Error(`Could not parse step: "${text}"`);
}

function resolveLocator(page: Page, target: string, fields?: FieldMap): Locator {
  const allFields = { ...COMMON_FIELDS, ...fields };

  const lower = target.toLowerCase();
  if (allFields[lower]) {
    return page.locator(allFields[lower]);
  }
  if (allFields[lower.replace(/^(button|link|field|input)\s+/, '')]) {
    const key = lower.replace(/^(button|link|field|input)\s+/, '');
    return page.locator(allFields[key]);
  }

  const byRole = page.getByRole('button', { name: target });
  if (target.length < 50) {
    const byText = page.getByText(target, { exact: false }).first();
    const byLabel = page.getByLabel(target, { exact: false });
    const byPlaceholder = page.getByPlaceholder(target);

    return page.locator([
      `input[name="${target}"]`,
      `input[id="${target}"]`,
      `button:has-text("${target}")`,
      `a:has-text("${target}")`,
      `[aria-label="${target}"]`,
    ].join(', ')).or(byRole as Locator).or(byText).or(byLabel).or(byPlaceholder);
  }

  return page.locator(`text=${target}`);
}

export async function runStep(
  page: Page,
  step: Step,
  options?: { fields?: FieldMap; baseUrl?: string },
): Promise<StepResult> {
  const raw = JSON.stringify(step);
  try {
    switch (step.action) {
      case 'goto': {
        const url = step.value!;
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        return { step, raw, passed: true };
      }

      case 'type': {
        const locator = resolveLocator(page, step.target!, options?.fields);
        await locator.fill(step.value!);
        return { step, raw, passed: true };
      }

      case 'click': {
        const locator = resolveLocator(page, step.target!, options?.fields);
        await locator.click();
        return { step, raw, passed: true };
      }

      case 'checkUrl': {
        await expect(page).toHaveURL(new RegExp(step.value!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        return { step, raw, passed: true };
      }

      case 'checkVisible': {
        const locator = resolveLocator(page, step.target!, options?.fields);
        await expect(locator.first()).toBeVisible();
        return { step, raw, passed: true };
      }

      case 'checkHidden': {
        const locator = resolveLocator(page, step.target!, options?.fields);
        await expect(locator.first()).toBeHidden();
        return { step, raw, passed: true };
      }

      case 'wait': {
        const ms = parseInt(step.value!, 10);
        await page.waitForTimeout(ms);
        return { step, raw, passed: true };
      }

      case 'select': {
        const locator = resolveLocator(page, step.target!, options?.fields);
        await locator.selectOption(step.value!);
        return { step, raw, passed: true };
      }

      case 'pressKey': {
        await page.keyboard.press(step.target!);
        return { step, raw, passed: true };
      }

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  } catch (error) {
    return {
      step,
      raw,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runWorkflow(
  page: Page,
  steps: string[],
  options?: { fields?: FieldMap; baseUrl?: string },
): Promise<StepResult[]> {
  const results: StepResult[] = [];
  for (const raw of steps) {
    const step = parseStep(raw);
    const result = await runStep(page, step, options);
    results.push(result);
    if (!result.passed) break;
  }
  return results;
}
