import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('external-ai')
@Public()
@Controller('api/ai')
export class AiController {
  @Post('forecast')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'AI spend forecast (not yet ported)' })
  async forecast() {
    return { error: 'AI forecast not yet implemented in this server' };
  }

  @Get('insight')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'AI business insights (not yet ported)' })
  async insight() {
    return { error: 'AI insight not yet implemented in this server' };
  }

  @Post('parse-invoice')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'AI invoice parsing (not yet ported)' })
  async parseInvoice() {
    return { error: 'AI invoice parsing not yet implemented in this server' };
  }

  @Post('parse-receipt')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'AI receipt parsing (not yet ported)' })
  async parseReceipt() {
    return { error: 'AI receipt parsing not yet implemented in this server' };
  }

  @Post('preprocess-image')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Image preprocessing (not yet ported)' })
  async preprocessImage() {
    return { error: 'Image preprocessing not yet implemented in this server' };
  }

  @Post('statement')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Bank statement parsing (not yet ported)' })
  async statement() {
    return { error: 'Bank statement parsing not yet implemented in this server' };
  }
}
