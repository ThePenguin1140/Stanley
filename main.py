import NHLParser
import json

data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")
nodes = NHLParser.buildNodes(data)

matrix = NHLParser.buildAdjacencyMatrix(nodes)

NHLParser.updateTeamNodes(nodes, matrix)

links = NHLParser.buildLinks(matrix)

output = {
    'nodes': nodes,
    'links': links
}

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
