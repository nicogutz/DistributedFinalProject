import random
from safrs import ValidationError, jsonapi_attr
from ..models import db, fake, FunctionDefault, BaseModel


class Menu(BaseModel):
    __tablename__ = "menus"
    http_methods = ["get", "options"]

    id = db.Column(db.Integer, primary_key=True)
    meals = db.relationship("Meal", back_populates="menu")
    limit = FunctionDefault(db.Integer, default=lambda: random.randint(30, 60))
    food = FunctionDefault(db.String(100), default=fake.dish)
    description = FunctionDefault(db.String(500), default=fake.dish_description)
    drink = FunctionDefault(db.String(100), default=lambda: fake.fruit() + " Juice")
    price = FunctionDefault(
        db.DECIMAL(7, 2), default=lambda: round(random.uniform(20, 200), 2)
    )
    image_url = FunctionDefault(
        db.String(100), default=lambda: f"/catering/img/{random.randint(1, 15)}"
    )


class Meal(BaseModel):
    __tablename__ = "meals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = FunctionDefault(db.String(100), default=fake.uuid4, nullable=False)
    menu_id = db.Column(db.Integer, db.ForeignKey("menus.id"), nullable=False)
    menu = db.relationship("Menu", back_populates="meals")
    meal_date = FunctionDefault(
        db.Date, default=lambda: fake.date_between(start_date="-1m", end_date="+1m")
    )
    status = FunctionDefault(
        db.String(100),
        default=lambda: random.choice(["reserved", "bought"]),
        nullable=False,
    )

    @classmethod
    def _s_post(cls, *args, **kwargs):
        print(kwargs)
        menu: Menu = Menu.query.get(kwargs["menu_id"])
        food_count = Meal.query.filter(Meal.menu == menu).count()
        if not menu or menu.limit < food_count:
            raise ValidationError("Food is out of stock.")

        result = cls(*args, **kwargs)
        return result


def populate_database():
    for _ in range(0, random.randint(5, 10)):
        menu = Menu()
        for _ in range(0, random.randint(5, 10)):
            Meal(menu_id=menu.id)
    return "Success"


models = [Menu, Meal]
