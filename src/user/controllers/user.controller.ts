import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';

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

    @hasRoles(UserRole.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findALl(): Observable<User[]>{
        return this.userService.findAll();
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
}
