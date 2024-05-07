// const {Pool} = require("pg");
// const pool = new Pool({
//     // Your database configuration
// });
//
// async function createNewScores(userID) {
//     const query = `
//         INSERT INTO SessionScores (userID, score)
//         VALUES ($1, $2) ON CONFLICT (userID) DO NOTHING;
//     `;
//     await pool.query(query, [userID, 0]);  // Passing 0 as the initial score
// }
//
// module.exports({createNewScores})
//
// async function deleteUserEntry(userID) {
//     try {
//         const query = 'DELETE FROM SessionScores WHERE userID = $1;';
//         const result = await pool.query(query, [userID]);
//         if (result.rowCount > 0) {
//             console.log(`Successfully deleted user entry for userID: ${userID}`);
//         } else {
//             console.log(`No user entry found for userID: ${userID}, nothing was deleted.`);
//         }
//     } catch (error) {
//         console.error(`Error deleting user entry for userID: ${userID}`, error);
//     }
// }