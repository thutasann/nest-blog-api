import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
const slugify = require('slugify');

@Injectable()
export class BlogService {

    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntryEntity>,
        private userService: UserService
    ){
    }

    create(user: User, blogEntry: BlogEntry): Observable<BlogEntry>{
        blogEntry.author = user;
        return  this.generateSlug(blogEntry.title).pipe(
            switchMap((slug: string) => {
                blogEntry.slug = slug;
                return from(this.blogRepository.save(blogEntry));
            })
        )
    }

    /**
     * Slug the Title
     * @param title 
     * @returns 
     */
    generateSlug(title: string): Observable<string>{
        return of(slugify(title))
    }

    /**
     * Find all blogs
     */
    findAll(): Observable<BlogEntry[]>{
        return from(this.blogRepository.find({
            relations: ['author']
        }));
    }

    /**
     * Pagination for All blogs
     */
    paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>>{
        return from(paginate<BlogEntry>(this.blogRepository, options, {
            relations: ['author']
        })).pipe(
            map((blogEntries: Pagination<BlogEntry>) => blogEntries)
        )
    }

    /**
     * Paginate By Users
     */
    paginateByUser(options: IPaginationOptions, userId: any): Observable<Pagination<BlogEntry>> {
        return from(paginate<BlogEntry>(this.blogRepository, options, {
            relations: ['author'],
            where: {
                author: userId
            }
        })).pipe(
            map((blogEntries: Pagination<BlogEntry>) => blogEntries)
        )
    }

    /**
     * Find blog by user
     */
    findByUser(userId: any): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({
            where: {
                author: userId
            },
            relations: ['author']
        })).pipe(map((blogEntries: BlogEntry[]) => blogEntries))
    }

    /**
     * Find Blog with ID
     */
    findOne(id: number): Observable<BlogEntry>{
        return from(this.blogRepository.findOne({
            where: {
                id
            },
            relations: ['author']
        }))
    }

    updateOne(id: number, blogEntry: BlogEntry){
        return from(this.blogRepository.update(id, blogEntry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    deleteOne(id: number): Observable<any>{
        return from(this.blogRepository.delete(id))
    }
}

