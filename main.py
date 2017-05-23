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

teamDic = {}

for team in teams:
    teamDic[team['name']] = team

data['teams'] = teamDic

output = data;

with open('dataset.json', 'w+') as dataFile:
    dataFile.write(json.dumps(output, indent=4))
