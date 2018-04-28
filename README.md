# NullTracker
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FNullRebel%2FNullTracker.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FNullRebel%2FNullTracker?ref=badge_shield)

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


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FNullRebel%2FNullTracker.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FNullRebel%2FNullTracker?ref=badge_large)