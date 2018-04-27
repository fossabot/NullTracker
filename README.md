# NullTracker
A Node/Javascript based torrent tracker running on SQL.

Live Version: http://tracker.nullrebel.com:1337/announce

Features:

- Announce
- Write Delay (inserts/updates are grouped together then executed at an interval. Helps mainly when opening new connections is expensive [such as an offsite sql server])


Work In Progress:

- Stats

Planned Features:

- Scrape
- PeerBan (ban peers that send requests far too frequently)
