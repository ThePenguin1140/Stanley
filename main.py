import NHLParser
import json

data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")
nodes = NHLParser.buildTeamNodes(data)
#
nodes = NHLParser.buildTeamRosters(nodes)
NHLParser.buildPlayerNodes(nodes)
nodes = NHLParser.splitTeamByYears(nodes)
# print( nodes )
# links = NHLParser.buildLinks(nodes)
# with open('dataset.json') as data_file:
#     data = json.load(data_file)
links = NHLParser.buildArcLinks(nodes)

output = {
    'nodes': nodes,
    'links': links
}


with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
