const app = require("./src/app")
const ConnectDB = require(".//src/config/db")


ConnectDB();

app.listen(5001,()=>{
    try {
        console.log("Your server is running on port 5001")
    } catch (error) {
        console.log("Error occure in a server")
    }
})