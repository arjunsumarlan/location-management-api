# Location Management API

This is a NestJS-based API for managing hierarchical location entities. The API supports CRUD operations, including creating locations, updating locations, deleting locations, and querying locations with pagination, filtering by type, and nested relations.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Create Location](#create-location)
  - [Get All Locations](#get-all-locations)
  - [Get Location by ID](#get-location-by-id)
  - [Update Location](#update-location)
  - [Delete Location](#delete-location)
- [Pagination and Filtering](#pagination-and-filtering)
- [Entity Relationships](#entity-relationships)
- [Circular Reference Handling](#circular-reference-handling)
- [Error Handling](#error-handling)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:arjunsumarlan/location-management-api.git
   cd location-management-api
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Ensure you have a `.env` file with the necessary environment variables. Example:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
```

## Running the Application

To start the application in development mode, use:

```bash
npm run start:dev
```

The API will be available at `http://localhost:4000`.

## API Endpoints

### Create Location

- **Endpoint:** `POST /locations`
- **Description:** Creates a new location.
- **Body:**
  ```json
  {
    "building": "A",
    "name": "Car Park",
    "number": "A-CarPark",
    "area": 80.62,
    "parentId": 1
  }
  ```
- **Response:**
  ```json
  {
    "id": 2,
    "building": "A",
    "name": "Car Park",
    "number": "A-CarPark",
    "area": 80.62,
    "parent": {
      "id": 1
    }
  }
  ```

### Get All Locations

- **Endpoint:** `GET /locations`
- **Description:** Retrieves all locations with optional filtering and pagination.
- **Query Parameters:**
  - `type` (optional): `roots`, `children`, `both`
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "building": "A",
        "name": "Level 1",
        "number": "A-01",
        "area": 100.92,
        "parent": null,
        "children": [...]
      },
      ...
    ],
    "metadata": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "nextPage": 2,
      "previousPage": null
    }
  }
  ```

### Get Location by ID

- **Endpoint:** `GET /locations/:id`
- **Description:** Retrieves a single location by its ID.
- **Query Parameters:**
  - `includeChildren` (optional): Whether to include nested children (default: false)
- **Response:**
  ```json
  {
    "id": 1,
    "building": "A",
    "name": "Level 1",
    "number": "A-01",
    "area": 100.92,
    "parent": null,
    "children": [...]
  }
  ```

### Update Location

- **Endpoint:** `PATCH /locations/:id`
- **Description:** Updates an existing location.
- **Body:**
  ```json
  {
    "building": "B",
    "name": "Updated Name",
    "number": "B-01",
    "area": 90.0,
    "parentId": 2
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "building": "B",
    "name": "Updated Name",
    "number": "B-01",
    "area": 90.0,
    "parent": {
      "id": 2
    }
  }
  ```

### Delete Location

- **Endpoint:** `DELETE /locations/:id`
- **Description:** Deletes a location. If the location has both a parent and children, the children are reassigned to the parent before deletion.
- **Response:**
  ```json
  {
    "message": "Location deleted successfully."
  }
  ```

## Pagination and Filtering

The `findAll` endpoint supports pagination and filtering based on location type:

- **Pagination:** Controlled by `page` and `limit` query parameters.
- **Filtering:** Controlled by the `type` query parameter, which can be `roots`, `children`, or `both`.

## Entity Relationships

The `Location` entity supports hierarchical relationships:

- **Parent Location:** A location can have a parent.
- **Child Locations:** A location can have multiple children.

These relationships are managed using `ManyToOne` and `OneToMany` decorators in TypeORM.

## Circular Reference Handling

When updating a location's parent, the service checks for circular references to prevent a location from being set as a parent of its own child, ensuring data integrity.

## Error Handling

The API uses NestJS's built-in exception handling. Common errors include:

- **BadRequestException:** Thrown when invalid data is provided or circular references are detected during updates.
- **NotFoundException:** Thrown when a location with the specified ID does not exist.

## Running Tests

1. **Run All Tests**

   To run all the unit tests in the project:

   ```bash
   npm run test
   ```

2. **Run Tests with Coverage**

   To run all tests and generate a code coverage report:

   ```bash
   npm run test:cov
   ```

   This will display a coverage summary in the terminal and generate a detailed report in the `coverage/` directory.

3. **Run a Single Test File**

   If you want to run tests for a specific file, you can use the following command:

   ```bash
   npx jest path/to/your/test/file.spec.ts
   ```

   Example:

   ```bash
   npx jest src/location/location.service.spec.ts
   ```

4. **Watch Mode**

   To run tests in watch mode, which automatically re-runs tests when files are changed:

   ```bash
   npm run test:watch
   ```

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
