CREATE DATABASE  IF NOT EXISTS `tracker` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `tracker`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: nullrebel.com    Database: tracker
-- ------------------------------------------------------
-- Server version	5.5.5-10.0.34-MariaDB-0ubuntu0.16.04.1
--
-- This schema makes the following assumptions:
-- You have a user tracker@localhost that will be accessing the database
-- You do not currently have a database named 'tracker' and would like the database to be named 'tracker'

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
-- Table structure for table `torrents`
--

DROP TABLE IF EXISTS `torrents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `torrents` (
  `id` varchar(61) NOT NULL COMMENT 'Info_Hash+Peer_ID - generates a unique hash for use as a primary key. also enables quick searches when the tracker knows both the peerid and the torrent hash',
  `info_hash` varchar(40) NOT NULL COMMENT 'Torrent''s Info Hash.',
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
-- Dumping events for database 'tracker'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `clean_tracker_peers` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`tracker`@`localhost`*/ /*!50106 EVENT `clean_tracker_peers` ON SCHEDULE EVERY 1 HOUR STARTS '2018-04-24 00:00:00' ON COMPLETION PRESERVE ENABLE COMMENT 'Deletes peers that haven''t checked in for a while' DO DELETE FROM tracker.torrents
WHERE last_update < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))*1000 */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

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

-- Dump completed on 2018-04-24 20:52:41
