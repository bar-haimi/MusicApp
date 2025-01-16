//entry points for db

const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { playlistTable, songHistoryTable, songsInPlaylistTable, usersTable } = require('./db/schema');
const { and, desc, eq } = require('drizzle-orm');

const sqlite = new Database('sqlite.db');
const db = drizzle({ client: sqlite });

const bcrypt = require('bcryptjs');

/**
 * adds the new user with his password to database 
 * make sure username is valid before calling this function  
 * valid means doesnt exist in database and doesnt have weird chars like %$#@!^&*()-+=
 * 
 * make sure password is valid before calling this function
 * @param username - validated username
 * @param password - validated password
 */
 async function signIn(username : string , password : string){
  const result = await db.insert(usersTable).values({username: username , password: password});
  console.log(`sign in: ${result}`)
}


/**
 * @param name - username to check
 * @returns returns a boolean promise if the user exists in db or not
 */
  async function usernameExists(name: string): Promise<boolean> {
  const result = await db.select().from(usersTable).where(eq(usersTable.username, name))

  console.log(`username? ${result}`);

  return result.length > 0;
}


/**
 * 
 * @param username - username to check
 * @param password - encrypted!! password to compare to db
 * @returns is the login accepted or not by the db
 */
 async function login(username: string , password: string) : Promise<boolean>{
  const result = await db.select({password : usersTable.password})
  .from(usersTable)
  .where(eq(usersTable.username, username))

  if (result.length === 0) {
    return false; // User not found
  }

  console.log(`login: ${result}`);
  
  return await bcrypt.compare(password, result[0].password);
}

/**
 *  getting the listen history of a user
 * @param username - the user to get history from
 * @param amount - amount of songs to ask for in his history defaults to 10 songs
 */
async function getUserHistory(username: string, amount : number = 10){
  const result = await db.select()
  .from(songHistoryTable)
  .innerJoin(usersTable, eq(songHistoryTable.userId, usersTable.id))
  .where(eq(usersTable.username, username))
  .orderBy(desc(songHistoryTable.lastListen))
  .limit(amount)

  console.log(`getting history ${result}`);

  return result
}


/**
 * @param username - the user the playlist belongs to
 * @param playlistName - the playlist we want to get the songs of
 * @returns returns the songs name and link to play
 */
async function getPlaylist(username: string, playlistName: string){
  const result = await db
    .select({
      songLink: songsInPlaylistTable.songLink,
      songName: songsInPlaylistTable.songName,
    })
    .from(songsInPlaylistTable)
    .innerJoin(playlistTable, eq(songsInPlaylistTable.playlistId, playlistTable.id))
    .innerJoin(usersTable, eq(playlistTable.userId, usersTable.id))
    .where(and( 
      eq(usersTable.username , username),
      eq(playlistTable.name, playlistName)
    ))
    .orderBy(songsInPlaylistTable.songName); 


    console.log(`getting playlist ${result}`);
  
  return result;
}

/**
 * getting the list of playlists of a specific user
 * @param username 
 * @returns the playlists
 */
async function getPlaylistsOfUser(username: string){
  const userIdResult = await getUserId(username)

  if(userIdResult.length === 0) // user not found
    return;

  const userId = userIdResult[0].id;

  const playlists = await db
    .select({
      id: playlistTable.id,
      name: playlistTable.name,
    })
    .from(playlistTable)
    .where(eq(playlistTable.userId, userId));

  return playlists;
}


/**
 * 
 * @param username - name of the user the playlist belongs to
 * @param playlistName - new playlist name
 * @returns 
 */
async function createPlaylist(username: string , playlistName: string){
  const userIdResult = await getUserId(username)

  if(userIdResult.length === 0) // user not found
    return;

  const userId = userIdResult[0].id

  const result = await db.insert(playlistTable).values({
    userId: userId,
    name: playlistName
  })

  console.log(`creating playlist ${result}`);
}


/**
 * helper function to get user id from his name
 * @param username user name
 * @returns the user id
 */
async function getUserId(username: string){
  const result = await db
  .select({ id: usersTable.id })
  .from(usersTable)
  .where(eq(usersTable.username, username));

  return result
}


/**
 * 
 * @param username - username
 * @param playlistName - playlist to delete
 * @returns 
 */
async function deletePlaylist(username: string , playlistName : string){
  const userIdResult = await getUserId(username)

  if(userIdResult.length === 0) // user not found
    return;

  const userId = userIdResult[0].id

  const result = await db
    .delete(playlistTable)
    .where(and(
      eq(playlistTable.userId, userId),
      eq(playlistTable.name, playlistName)
    ))

    console.log(`playlist delete ${result}`)
}

/**
 * helper function to get the playlist id
 * @param userId - user who's playlist belong to
 * @param playlistName  - playlist name to find
 * @returns 
 */
async function getPlaylistId(userId: number, playlistName: string){
  const result = await db
    .select({ id: playlistTable.id })
    .from(playlistTable)
    .where(and(
      eq(playlistTable.userId, userId),
      eq(playlistTable.name, playlistName)
    ))

    return result;
  }

/**
 * 
 * @param username 
 * @param playlistName 
 * @param songLink 
 * @param songName 
 */
async function addSongToPlaylist(username: string, playlistName : string , songLink : string, songName: string){
  const userIdResult = await getUserId(username)

  if(userIdResult.length === 0) // user not found
    return;

  const userId = userIdResult[0].id

  const playlistIdResult = await getPlaylistId(userId, playlistName)
  
  if (playlistIdResult.length === 0)
    return // playlist not found

  const playlistId = playlistIdResult[0].id

  const result = await db
  .insert(songsInPlaylistTable)
  .values({
    playlistId: playlistId,
    songLink: songLink,
    songName: songName,
  });

  console.log(`Song added to playlist: ${result}`);
}


async function removeSongToPlaylist(username: string, playlistName : string , songLink : string, songName: string){
  const userIdResult = await getUserId(username)

  if(userIdResult.length === 0) // user not found
    return;

  const userId = userIdResult[0].id

  const playlistIdResult = await getPlaylistId(userId, playlistName)
  
  if (playlistIdResult.length === 0)
    return // playlist not found

  const playlistId = playlistIdResult[0].id

  const result = await db
  .delete(songsInPlaylistTable)
  .where(and(
    eq(songsInPlaylistTable.playlistId, playlistId),
    eq(songsInPlaylistTable.songLink, songLink)
  ));

  console.log(`Song removed from playlist: ${result}`);
}

module.exports = {
  signIn, 
  usernameExists, 
  login, 
  getUserHistory, 
  getPlaylist, 
  createPlaylist, 
  getUserId, 
  deletePlaylist, 
  addSongToPlaylist, 
  removeSongToPlaylist,
  getPlaylistsOfUser
};

