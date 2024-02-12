import mysql.connector, mysql.connector.pooling
import bcrypt
import requests

class DatabaseManager:
    def __init__(self, host, user, password, database):
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'example',
            'database': 'idmDB',
        }

    # def connect(self):
    #     try:
    #         self.connection = mysql.connector.connect(**self.db_config)
    #         if self.connection.is_connected():
    #             self.cursor = self.connection.cursor(buffered=True)
    #             print("Connected to the MariaDB database")
    #     except mysql.connector.Error as e:
    #         print(f"Error connecting to MariaDB: {e}")

    def connect(self):
        try:
            self.connection_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=5,
                **self.db_config
            )
            print("Connected to the MariaDB database pool")
        except mysql.connector.Error as e:
            print(f"Error connecting to MariaDB: {e}")

    def get_connection(self):
        try:
            return self.connection_pool.get_connection()
        except mysql.connector.Error as e:
            print(f"Error getting connection from pool: {e}")
            return None
    
    def disconnect(self):
        if self.connection_pool:
            self.connection_pool.close()
            print("Connection pool closed")

    # def disconnect(self):
    #     if self.connection.is_connected():
    #         self.cursor.close()
    #         self.connection.close()
    #         print("Connection closed")

    def register(self, username, password, email, role):
        print(f"{username} {password} {email} {role}")
        insert_data_query = "INSERT INTO users (username, password, email, role) VALUES (%s, %s, %s, %s)"
        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(insert_data_query, (username, bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()), email, role))
                    connection.commit()
                    
                    print(f"User {username} inserted into the 'users' table")
                    return True
                else:
                    print("Connection with db not established!")
                    return False
        except Exception as e:
            print(f"Error registering user : {e}")
            return False

    def get_users(self, role):
        get_data_query = "SELECT id, username, email FROM  users WHERE role=%s"
        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(get_data_query, (role,))
                    users = self.cursor.fetchall()
                    
                    if users:
                        print(f"Users extracted from 'users' table")
                        return users
                    else:
                        return None
                else:
                    print("Connection with db not established!")
                    return False
        except Exception as e:
            print(f"Error registering user : {e}")
            return None

    def delete(self, id):
        data_query = "DELETE FROM users WHERE id = %s"
        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(data_query, (id,))
                    connection.commit()
                    
                    print(f"User with id={id} removed from  the 'users' table")
                    return True
                else:
                    print("Connection with db not established!")
                    return False
        except Exception as e:
            print(f"Error deleting user : {e}")
            return False


    def login(self, username, password):
        login_query = "select id, username, password, role from users where username = %s"

        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(login_query, (username,))
                    user = self.cursor.fetchone()
                    if user:
                        hashed_password = user[2]
                        if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
                            print("Authentication successful!")
                            return user
                        else:
                            print("Incorrect password")
                    else:
                        print(f"Username not found")
                else:
                    print("Connection with db not established!")
        except Exception as e:
            print(f"Error authenticating user : {e}")
        return None

    def change_password(self, username, old_password, new_password):
        get_user_query = "select username, password from users where username = %s"
        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(get_user_query, (username,))
                    user = self.cursor.fetchone()
                    if user:
                        hashed_password = user[1]
                        if bcrypt.checkpw(old_password.encode('utf-8'), hashed_password.encode('utf-8')):
                            new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
                            update_password_query = "UPDATE users SET password = %s WHERE username = %s;"
                            try:
                                self.cursor.execute(update_password_query, (new_hashed_password, username,))
                            except Exception as e:
                                print(f"Error updating  password: {e}")
                                return False
                        else:
                            print("Incorrect password!")
                            return False
                    else:
                        print("User not found!")
                        return False
                else:
                    print("Connection with db not established!")
                    return False
        except Exception as e:
            print(f"Error getting user for changin password: {e}")
            return False
        return True

    def get_user_id(self, username):
        get_id_query = "select id from users where username=%s"
        try:
            with self.get_connection() as connection:
                if connection.is_connected():
                    self.cursor = connection.cursor(buffered=True)
                    self.cursor.execute(get_id_query, (username,))
                    id = self.cursor.fetchone()
                    print("ID: ")
                    print(id[0])
                    if id[0]:
                        return id[0]
                    else:
                        return -1
                else:
                    print("Connection with db not established!")
                    return -1
        except Exception as e:
            print(f"Error getting id for user: {e}")
            return -1

    def get_patient_id(self, id):
        response = requests.get(f"http://localhost:8082/api/medical_office/patients?user_id={id}")
        if response.status_code == 200:
            print(response.json()['cnp'])
            return response.json()['cnp']

    def get_doctor_id(self, id):
        response = requests.get(f"http://localhost:8082/api/medical_office/physicians?user_id={id}")
        if response.status_code == 200:
            print(response.json()['id'])
            return response.json()['id']


db = DatabaseManager(host='localhost', user='your_username', password='your_password', database='your_database')
db.connect()