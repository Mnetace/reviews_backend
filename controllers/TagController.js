import TagModel from '../models/Tag.js'

// Get all tags
export const get_all = async (req, res) => {
  try {
    const tags = await TagModel.find().exec()

    if (!tags) {
      return res.status(404).json({
        message: 'Tags not found!',
      })
    }

    res.json(tags)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access!',
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new TagModel({
      text: req.body.text,
    })

    const tag = await doc.save()

    res.json(tag)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to create an article',
    })
  }
}
