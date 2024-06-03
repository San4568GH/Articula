import mongoose from "mongoose";
const { Schema, model } = mongoose;

//Define the Post Structure/Schema
const PostSchema = new Schema({
  title: String,
  summary: String,
  content: String,
  cover: String, //Cover param is string because its a pathname to the actual image
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  //^^not UserModel,because we assign it 'User' name instead,so it references by name
}, {
  timestamps: true,  //creates updatedAt,createdAt params
});

const PostModel = model('Post', PostSchema);
export default PostModel;
