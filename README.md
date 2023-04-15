Step-by-Step Guide to Running the Application
1. Install Node.js 18 on your system.
2. Clone the repository. 
    ```
    git clone https://github.com/zaenalarifin12/test-be-Upscalix
    ```
3. enter directory 
   ``` 
   cd test-be-Upscalix 
   ```
4. Run the command to install the required 
   dependencies.
    ```
    npm i
    ```
5. To run the application via Docker, execute the following commands:
    ```
    docker-compose build --no-cache
    docker-compose up
    ```
6. Wait for approximately 52 minutes until you can access the application rabbitMQ at 
   ```
   http://127.0.0.1:15672/
   ```

7.  run this command for migrate table 
    ``` 
    knex migrate:latest
    ```

8.  enter new terminal to run test and change line 
    change userController.test.js ```line 19``` for change the date

    ``` 
    cd test-be-Upscalix
    npm run test 
    ```

9. To check the status of the email sending feature, enter the log terminal in the container app.






