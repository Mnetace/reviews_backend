export const get_all = async (req, res) => {
    res.json([
        'Films', 'Books', 'Games'
    ])
}