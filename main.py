import NHLParser
import json

data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")

rosters = {}
links = []
teams = {}
nodes = []

for playerData in data:

    for year, team in playerData['wins'].iteritems():
        if( team not in teams.keys() ):
            teams[team] = {
                'wins': {
                    year: []
                },
                'winCount': 1,
                'name': team
            }
        else:
            if( year not in teams[team]['wins'] ):
                #add year to wins
                teams[team]['wins'][year] = []
                teams[team]['winCount'] = teams[team]['winCount'] + 1


    #then build adjacency matrix with those indices

    #then build links from that matrix and fill in rosters in team nodes

for key, value in teams.iteritems():
    nodes.append(value)

nodes.extend(data)

output = {
    'nodes': nodes,
    'links': links
}

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
