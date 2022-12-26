import TagModel from '../models/Tag.js'

// Get all tags
export const get_all = async (req, res) => {
  const tags = await TagModel.find().exec()

  if (!tags) {
    return res.status(404).json({
      message: 'Tags not found!',
    })
  }

  res.json(tags)
}
