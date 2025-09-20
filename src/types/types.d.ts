//  In Mongoose, a Connection is an object that represents a connection to a MongoDB database. 
import { Connection } from "mongoose";
/* declare global is a TypeScript syntax that is used to declare global types or variables that are available throughout the application, without having to import them explicitly in every file. It extends the global scope with the new type or value.*/
declare global {
    // This declares a global variable named mongoose
  var mongoose: {
    /* conn will store a Mongoose Connection object or null. The type Connection | null indicates that this property can either be a Mongoose connection object (which is used to interact with MongoDB) or null if no connection is established */
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

/* In TypeScript, if you don’t have any export or import statements in a file, TypeScript treats the file as a script, and global variables can be accessed directly. The export {}; statement is used to explicitly mark this file as a module, preventing any conflicts with other global declarations that might exist in other parts of your application. */
export {};