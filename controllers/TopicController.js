import TopicModel from '../models/Topic.js'

export const get_all = async (req, res) => {
  const topics = await TopicModel.find().exec()

  res.json(topics)
}