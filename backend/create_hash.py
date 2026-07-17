
from werkzeug.security import generate_password_hash

admins = [
    {
        "name": "Shaboda",
        "email": "shabodathebuwana@gmail.com",
        "password": "3411"
    },
    {
        "name": "Nimsara",
        "email": "nimsaraprabodani6@gmail.com",
        "password": "1129"
    },
    {
        "name": "Arani",
        "email": "rathnasinghearani@gmail.com",
        "password": "1128"
    },
    {
        "name": "Chamodi",
        "email": "c26104014@gmail.com",
        "password": "1217"
    },
    {
        "name": "Harithma",
        "email": "Oliviya702@gmail.com",
        "password": "0109"
    }
]


for admin in admins:
    hashed_password = generate_password_hash(admin["password"])

    print("Name:", admin["name"])
    print("Email:", admin["email"])
    print("Password Hash:", hashed_password)
    print("----------------------")
