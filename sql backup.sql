CREATE DATABASE  IF NOT EXISTS `tracker` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `tracker`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tracker
-- ------------------------------------------------------
-- Server version	5.5.52

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bans`
--

DROP TABLE IF EXISTS `bans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bans` (
  `peer` varchar(20) NOT NULL COMMENT 'Peer''s ID',
  `strikes` smallint(6) DEFAULT NULL COMMENT 'number of times a ban has been issued.',
  `currentban` bigint(20) unsigned DEFAULT NULL,
  `probation_end` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`peer`),
  UNIQUE KEY `peer_UNIQUE` (`peer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Manages peer bans. Bans occur because of various reasons, such as announcing too frequently.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bans`
--

LOCK TABLES `bans` WRITE;
/*!40000 ALTER TABLE `bans` DISABLE KEYS */;
/*!40000 ALTER TABLE `bans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torrents`
--

DROP TABLE IF EXISTS `torrents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `torrents` (
  `id` varchar(41) NOT NULL COMMENT 'Info_Hash+Peer_ID - generates a unique hash for use as a primary key. also enables quick searches when the tracker knows both the peerid and the torrent hash',
  `info_hash` varchar(20) NOT NULL COMMENT 'Torrent''s Info Hash.',
  `peer_id` varchar(20) NOT NULL COMMENT 'Peer''s ID.',
  `port` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'Peer''s connection port.',
  `uploaded` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT 'Amount the client has uploaded in whole bytes',
  `downloaded` bigint(20) unsigned NOT NULL DEFAULT '0',
  `togo` bigint(20) unsigned NOT NULL DEFAULT '0',
  `event` varchar(10) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `last_update` double unsigned DEFAULT NULL,
  `connected_time` double unsigned DEFAULT NULL,
  `ratio` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torrents`
--

LOCK TABLES `torrents` WRITE;
/*!40000 ALTER TABLE `torrents` DISABLE KEYS */;
INSERT INTO `torrents` VALUES ('5d442f0e42af47cced91--TO0001-XX1492103524','5d442f0e42af47cced91','-TO0001-XX1492103524',999,0,0,0,NULL,'127.0.0.1',1492566732385,0,0);
/*!40000 ALTER TABLE `torrents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'tracker'
--

--
-- Dumping routines for database 'tracker'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-18 21:31:12
