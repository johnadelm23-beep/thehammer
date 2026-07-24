import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { QuotesModule } from './quotes/quotes.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [ProductsModule, QuotesModule, CmsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
