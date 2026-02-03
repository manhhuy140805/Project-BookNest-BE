import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto';
import { UserData } from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';
import { IsPublic, IsCache } from 'src/common/decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('history')
  @IsCache('search:history', 300)
  getHistory(@UserData() user: User) {
    return this.searchService.getHistory(user.id);
  }

  @Get('suggestions')
  @IsPublic()
  @IsCache('search:suggestions', 600)
  getSuggestions(@Query() dto: SearchQueryDto) {
    return this.searchService.getSuggestions(dto.q);
  }

  @Get('trending')
  @IsPublic()
  @IsCache('search:trending', 1800)
  getTrending() {
    return this.searchService.getTrendingSearches(10);
  }

  @Post('clear-history')
  clearHistory(@UserData() user: User) {
    return this.searchService.clearHistory(user.id);
  }

  @Delete('history/:id')
  deleteSearch(@UserData() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.searchService.deleteSearch(user.id, id);
  }
}
