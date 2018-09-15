# telegram-to-mysql
Extract telegram exported files into MySql table

## How to use the program

- Export telegram chats(Text only)
- Update the `path` variable to the exported folder path
- Update the connection settings
- Create a table in the database named `messages` with following columns
  - id - varchar(50)
  - datetime - datetime
  - type - varchar(50)
  - from - varchar(50)
  - text - text (charset should be utf8mb4)
- Run the program

