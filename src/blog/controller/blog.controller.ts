import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { from, Observable, of, switchMap, tap } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogImage } from '../model/image.interface';
import { BlogService } from '../service/blog.service';
import {diskStorage} from "multer";
import { v4 as uuidv4} from 'uuid';
import path = require('path');
import { join } from 'path';

export const BLOG_ENTRIES_URL = 'http://localhost:3000/api/blogs';


export const storage = {
    storage: diskStorage({
        destination: './uploads/blog-entry-images',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}
@Controller('blogs')
export class BlogController {

    constructor(private blogService: BlogService){}

    @Get('')
    index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ){
        limit = limit > 100 ? 100: limit;
        return this.blogService.paginateAll({
            limit: Number(limit),
            page: Number(page),
            route: BLOG_ENTRIES_URL
        })
    }

    @Get('user/:user')
    indexByUser(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Param('user') userId: number
    ){
        limit = limit > 100 ? 100: limit;
        return this.blogService.paginateByUser({
            limit: Number(limit),
            page: Number(page),
            route: BLOG_ENTRIES_URL
        }, Number(userId))
    }


    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Body()blogEntry: BlogEntry, @Request() req): Observable<BlogEntry>{
        const user = req.user;
        return this.blogService.create(user, blogEntry)
    }

    @Get('fetch')
    findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]>{
        if(userId == null){
            return this.blogService.findAll();
        }
        else{
            return this.blogService.findByUser(userId);
        }
    }

    @Get('fetch/:id')
    findOne(@Param('id') id: number): Observable<BlogEntry>{
        return this.blogService.findOne(id);
    }
    
    @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
    @Put('update/:id')
    updateOne(@Param('id') id: number, @Body() blogEntry: BlogEntry ): Observable<BlogEntry>{
        return from(this.blogService.updateOne(id, blogEntry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
    @Delete('delete/:id')
    deleteOne(@Param('id') id: number): Observable<any>{
        return this.blogService.deleteOne(id);
    }


    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<BlogImage>{
        return of(file)
    }


    @Get('blog-image/:imagename')
    findBlogImage(@Param('imagename') imagename: string, @Res() res: any): Observable<Object>{
        return of(res.sendFile(join(process.cwd(), 'uploads/blog-entry-images/' + imagename)));
    }

}
