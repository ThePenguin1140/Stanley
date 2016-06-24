import NHLParser
import json

data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")

rosters = {}
links = []
teams = []

for playerData in data:
    for year, team in playerData['wins'].iteritems():
        if(year not in rosters.keys()):
            rosters[year] = [playerData['id']]
        else:
            players = rosters[year]
            players.extend([playerData['id']])
            rosters[year] = players

for year, players in rosters.iteritems():
    src = players[0]
    for player in players[1:]:
        entry = {'source': src, 'target': player, 'year': year}
        links.extend([entry])



output = {
    'players': data,
    'links': links
}

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))