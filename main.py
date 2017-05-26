import NHLParser
import json

# data = NHLParser.parse_to_json("NHL_Winners.csv", "NHL_Winners.json")
#
# raw = NHLParser.buildTeamNodes(data)

#
# nodes = NHLParser.buildTeamRosters(raw)
# nodes = NHLParser.splitTeamByYears(nodes)
#
# links = NHLParser.buildArcLinks(nodes)

# output = {
#     'nodes': nodes,
#     'links': links,
#     'teams': [ x for x in raw if x['group'] == 1 ],
#     'players': [ x for x in raw if x['group'] == 2 ],
# }

with open('dataset.json') as data_file:
    data = json.load(data_file)

teams = data['teams']
nodes = data['nodes']
links = data['links']
players = data['players']

for key, value in teams.items():
    for year, roster in value['wins'].items():
        matches = [ x for x in nodes if x['group'] == 1 and x['year'] == year and x['name'] == key ]
        value['wins'][year] = matches[0]['id']

# teamDic = {}

# for team in teams:
#     teamDic[team['name']] = team
#
data['teams'] = teams

output = data

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
