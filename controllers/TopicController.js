import TopicModel from '../models/Topic'

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

export const create = async (req, res) => {
  try {
    const doc = new TopicModel({
      title: req.body.title,
      group: req.body.group,
    })

    const topic = await doc.save()

    res.json(topic)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to create an topic',
    })
  }
}
