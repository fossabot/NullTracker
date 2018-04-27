//This module handles stats.

module.exports.stats = function (req, res) {
	var statstemplate =
		`
	<html>
		<head>
			
		</head>
		<body>
			<p>This is the future home of the stats page. Check back soon!</p>
		</body>
	</html>
		`;

	res.send(statstemplate);
}
