import NHLParser
import json

data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")
nodes = NHLParser.buildTeamNodes(data)

NHLParser.buildTeamRosters(nodes)

links = NHLParser.buildLinks(nodes)

output = {
    'nodes': nodes,
    'links': links
}

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
