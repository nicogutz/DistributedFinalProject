import random
from flask_sqlalchemy import SQLAlchemy
from safrs import SAFRSBase, SAFRSFormattedResponse, ValidationError, jsonapi_rpc
import datetime
from faker import Faker

fake = Faker()
db = SQLAlchemy()

random.seed(1)
Faker.seed(1)


class TimeColumn(db.Column):
    def utcnow():
        return

    sample = utcnow()
    default = utcnow


def FunctionDefault(col, **kwargs):
    _sample = None
    try:
        _sample = kwargs["default"]()
    except (KeyError, TypeError):
        print("FunctionDefault: Default is not a function or not found.")

    cls = type(f"Column_{col}_{_sample}", (db.Column,), dict(sample=_sample))
    return cls(col, **kwargs)


class BaseModel(SAFRSBase, db.Model):
    __abstract__ = True
    created_at = FunctionDefault(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    modified_at = FunctionDefault(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )


class Employee(BaseModel):
    __tablename__ = "employees"
    id = db.Column(db.Integer, primary_key=True)
    first_name = FunctionDefault(db.String(50), default=fake.first_name)
    last_name = FunctionDefault(db.String(50), default=fake.last_name)
    email = FunctionDefault(db.String(120), default=fake.email)
    privileges = FunctionDefault(db.String(50), default=fake.job)
    hire_date = FunctionDefault(
        db.Date, default=lambda: fake.date_between(start_date="-10y", end_date="today")
    )
    salary = FunctionDefault(
        db.DECIMAL(7, 2), default=lambda: round(random.uniform(30000, 100000), 2)
    )


class Venue(BaseModel):
    __tablename__ = "venues"
    id = db.Column(db.Integer, primary_key=True)
    name = FunctionDefault(db.String(100), default=fake.catch_phrase)
    location = FunctionDefault(db.String(200), default=fake.address)
    capacity = FunctionDefault(db.Integer, default=lambda: random.randint(50, 500))
    event = db.relationship("Event", back_populates="venue")


class Event(BaseModel):
    __tablename__ = "events"
    id = db.Column(db.Integer, primary_key=True)
    venue_id = db.Column(db.Integer, db.ForeignKey("venues.id"), nullable=False)
    venue = db.relationship("Venue", back_populates="event")
    ticket = db.relationship("Ticket", back_populates="event")

    max_price = FunctionDefault(db.Float, default=lambda: random.randint(50, 100))
    name = FunctionDefault(db.String(100), default=fake.catch_phrase)
    date = FunctionDefault(
        db.Date, default=lambda: fake.date_between(start_date="-1y", end_date="today")
    )

    @jsonapi_rpc(http_methods=["POST"])
    def buy_ticket(self, user_id: str):
        """
        pageable: false
        args:
            user_id: The Firebase user ID
        """
        capacity = Venue.query.get(self.venue_id).capacity
        ticket_count = Ticket.query.count()

        if capacity > ticket_count:
            raise ValidationError("Event is fully booked.")

        ticket = Ticket(user_id=user_id, event_id=self.id, price=self.max_price)

        self.max_price = round(self.max_price * (capacity / ticket_count))
        return SAFRSFormattedResponse(ticket)


class Ticket(BaseModel):
    __tablename__ = "tickets"
    http_methods = ["get", "delete"]

    id = db.Column(db.Integer, primary_key=True)
    user_id = FunctionDefault(db.String(100), default=fake.uuid4, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    event = db.relationship("Event", back_populates="ticket")
    price = FunctionDefault(
        db.DECIMAL(7, 2), default=lambda: round(random.uniform(20, 200), 2)
    )
    sold_date = FunctionDefault(
        db.Date, default=lambda: fake.date_between(start_date="-1y", end_date="today")
    )


models = [Employee, Event, Ticket, Venue]


def populate_database():
    db.drop_all()
    db.create_all()
    for _ in range(0, 40):
        Employees()

    for _ in range(0, random.randint(4, 6)):
        venue = Venue()
        for _ in range(0, random.randint(9, 20)):
            event = Event(venue_id=venue.id)
            for _ in range(0, random.randint(0, round(venue.capacity / 2))):
                Ticket(event_id=event.id)
    return "Success"