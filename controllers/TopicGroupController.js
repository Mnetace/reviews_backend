export const knownTopicGroups = ['Films', 'Books', 'Games']

export const get_all = async (req, res) => {
    res.json([knownTopicGroups])
}