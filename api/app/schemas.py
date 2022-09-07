from datetime import date
from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    password: str
    is_admin: bool
    
    
class showUser(BaseModel):
    username: str
    
    class Config():
        orm_mode = True
        
class Login(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    username: Optional[str] = None
    
    
    

class RoomTypes(BaseModel):
    room_type: str
    cost: int
    class Config():
        orm_mode = True

class RoomTypeBase(BaseModel):
    room_type: str
    description: str
    cost: float
    class Config():
        orm_mode = True



class RoomBase(BaseModel):
    room_name: str
    room_typeid: int
    available: bool
    class Config():
        orm_mode = True
        
class RoomUpdate(BaseModel):
    available: bool
    checked: bool
    
    
class RoomTypeUpdate(BaseModel):
    description: str
    cost: int
    
    
class Room(RoomBase):
    class Config:
        orm_mode = True 
    
class ListRoom(Room):
    id: int
    checked: bool
    room_type: RoomTypes
    
    
    class Config():
        orm_mode = True
    
class GuestBase(BaseModel):
    name: str
    address: str
    phone_no: str
    class Config(): 
        orm_mode =True
    

class BookingsBase(BaseModel):
    room_id: int
    guest_id: int
    checkin_date: date
    checkout_date: date
    total_price: int
    payment_status: bool
    
    class Config():
        orm_mode = True
        
class Booking(BookingsBase):
    booking_date: date
    class Config:
        orm_mode = True
        
class BookingList(Booking):
    id: int
    guest: GuestBase
    
    class Config():
        orm_mode = True
    
    
class HallBookingsBase(BaseModel):
    hall_id: int
    guest_id: int
    checkin_date: date
    checkout_date: date
    total_price: int
    payment_status: bool

    
class HallBase(BaseModel):
    hall_name: str
    seats: int
    cost: int
    booked: bool
    
class Rooms(BaseModel):
    room: RoomBase
    room_type: RoomTypeBase
