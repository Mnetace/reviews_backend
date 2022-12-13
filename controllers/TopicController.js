import TopicModel from '../models/Topic.js'

export const get_all = async (req, res) => {
  try {
    const topics = await TopicModel.find().exec()

    if (!topics) {
      return res.status(404).json({
        message: 'Topics not found!',
      })
    }

    res.json(topics)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access!',
    })
  }
}