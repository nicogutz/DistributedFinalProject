# Firebase Event packages
## Setup
To set up the project for the first time run the following:
```
chmod +x ./setup.sh
./setup.sh
```

## Activate the virtual environment
Activate the virtual environment by running the following command:
```
source ./venv/bin/activate
```

## Running
The setup script automatically builds the sites so you only have to run:
```
npm run dev
```
This deploys the website locally and initiates a firestore database, which will store data locally for faster access. The local website can be accessed through the following URL: http://localhost:3030/


