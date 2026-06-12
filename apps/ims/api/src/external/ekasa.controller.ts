import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('external-ekasa')
@Public()
@Controller('api/ekasa')
export class EkasaController {
  @Post()
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Slovak eKasa receipt lookup (not yet ported)' })
  async lookupReceipt(
    @Body() body: Record<string, unknown>,
  ) {
    return { error: 'eKasa lookup not yet implemented in this server' };
  }
}
