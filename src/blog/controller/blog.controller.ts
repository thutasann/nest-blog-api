import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { from, Observable, switchMap, tap } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

@Controller('blogs')
export class BlogController {

    constructor(private blogService: BlogService){}

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

}
