#  ________________________
# |     |     |     |     |
# |  X  |  X  |     |  1  |
# |     |     |     |     |
#  ________________________
# |     |     |     |     |
# |  4  |     |     |  X  |
# |     |     |     |     |
#  ________________________
# |     |     |     |     |
# |     |  2  |  X  |  1  |
# |     |     |     |     |
#  ________________________
# |     |     |     |     |
# |     |  X  |  1  |     |
# |     |     |     |     |
#  ________________________

# keep 3 arrays:
# 1. Pre-fill negs
# 2. Pre-fill nums
# 3. My fill-in positives
# 4. My fill-in negatives

#For puzzle size n * n
#top left tile is 0,0
#bottom left is n,0
#top right is 0,n
#bottom right is n,n

#helpers

#Border cases

#case 1
#when the tile is cramped
#if the connected free space in the row/column of the tile is y
def extend_cramped_border_tiles_inwards():
    if y <= x:
        a = x-y
        then the a adjacent inner tiles are positive
    return "complete"

#case 2
#when the tile is on a border adjacent to a tile of lesser or greater value
#for example if on the top row there is a tile of value 4 adjacent to a tile of value 7
# we can extend the 7 3 spots inwards
#steps:
# 1. check border rows and columns for tiles
# 2. check for adjacent tiles
# 3. if the tiles are of the same value(s), ignore
# 4. if the tiles are different values, extend the greater tiles by the difference between them and the least valued adjacent tile
def check_borders_for_inequal_adjacents():
    return "inequal_adjacent_locations_for_given_side_as_a_list"

def extend_greater_inequal_adjacents(list_of_locations):
    lowest_val_tile = #the lowest valued tile
    lowest_tile_val = #the value of the lowest valued tile

    for items in list_of_locations - lowest_val_tile:
        item.value - lowest_tile_val = a
        extend_border_inwards(tile,side,a)