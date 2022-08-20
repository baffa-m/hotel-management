from datetime import date
from pydantic import BaseModel
from typing import List

class RoomTypes(BaseModel):
    room_type: str
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
    class Config():
        orm_mode = True
    
class Room(RoomBase):
    class Config:
        orm_mode = True 
    
class ListRoom(Room):
    id: int
    room_type: RoomTypes
    
    class Config():
        orm_mode = True
    
class GuestBase(BaseModel):
    name: str
    address: str
    phone_no: str
    

class BookingsBase(BaseModel):
    room_id: int
    guest_id: int
    booking_date: date
    checkin_date: date
    checkout_date: date
    checkout_time: date
    
class HallBase(BaseModel):
    hall_name: str
    seats: int
    cost: int
