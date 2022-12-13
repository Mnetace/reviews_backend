import mongoose from "mongoose";

export const db = await mongoose
    .connect(
        'mongodb+srv://admin:wwwwww@cluster0.lpglxzt.mongodb.net/viewer?retryWrites=true&w=majority'
    )
    .then(db => {
        console.log('The DB is OK!')
        return db
    })
    .catch((err) => {
        console.log('The DB is error!', err)
    })

export const session = await db.startSession()