import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {diskStorage} from "multer";
import { v4 as uuidv4} from 'uuid';
import path = require('path');
import { join } from 'path';


export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}

@Controller('users')
export class UserController {

    constructor(
        private userService: UserService
    ){}

    @Post('create')
    create(@Body() user: User): Observable<User | Object>{
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({
                error: err.message
            }))
        )
    }

    @Post('login')
    login(@Body() user: User): Observable<Object>{
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return {
                    access_token: jwt
                }
            })
        )
    }

    @Get(':id')
    findOne(@Param('id') id: number): Observable<User>{
        return this.userService.findOne(id);
    }

    // @hasRoles(UserRole.USER)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    index(
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 5,
        @Query('username') username: string
    ): Observable<Pagination<User>>{
        limit = limit > 100 ? 100 : limit;

        if (username === null || username === undefined) {
            return this.userService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' });
        } else {
            return this.userService.paginateFilterByUsername(
                { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' },
                { username }
            )
        }
    }

    @Delete('delete/:id')
    deleteOne(@Param('id') id: number): Observable<User>{
        return this.userService.deleteOne(Number(id));
    }   

    @Put('update/:id')
    updateOne(@Param('id') id: string, @Body() user: User): Observable<any>{
        return this.userService.updateOne(Number(id), user);
    }

    @Put('update-role/:id')
    updateUserRole(@Param('id') id: string, @Body() user: User): Observable<User>{
        return this.userService.updateUserRole(Number(id), user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object>{
        const user: User = req.user.user;
        return this.userService.updateOne(user.id, {
            profileImage: file.filename
        }).pipe(
            tap((user: User) => console.log(user)),
            map((user: User) => ({
                profileImage: user.profileImage
            }))
        )
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename: string, @Res() res: any): Observable<Object>{
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
}
