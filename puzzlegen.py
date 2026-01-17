from pickle import FALSE
import numpy as np
import random as rand

debug_level = 1

def generate_blank():
    #Generates blank grid
    global n
    n = int(input("n = "))
    print(f"Generating a puzzle of size {n} by {n}")
    return np.zeros((n,n))

blank_puzzle = generate_blank()
puzzle = blank_puzzle

#helpers
def print_line_break():
    print("-------------------------------------------------")

def print_puzzle(puz):
    for row in puz:
        print("   ")
        for element in row:
            print(int(element), end='   ')
    print("")
    
def how_many_filled(puz):
    filled = 0
    for row in puz:
        for element in row:
            if element == -1:
                filled += 1
    return filled

def border_bools(x,y):
    top,left,bottom,right = False, False, False, False
    #check if in top row
    if x == 0: top = True
    #check if in left column
    if y == 0: left = True
    #check if in bottom row
    if x == n-1: bottom = True
    #check if in right column
    if y == n-1: right = True

    return top,left,bottom,right

def check_corner(a,b,c,d):
    cornerstatus = 0
    if a and b == True: cornerstatus = 1
    if a and d == True: cornerstatus = 2
    if b and c == True: cornerstatus = 3
    if c and d == True: cornerstatus = 4
        
    return cornerstatus
    
def border_status(x,y):
    top,left,bottom,right = border_bools(x,y)
    cornval = check_corner(top,left,bottom,right)
    # types of border status
    # 1. top left corner
    # 2. bottom left corner
    # 3. top right corner
    # 4. bottom right corner
    if cornval > 0: return cornval

    # 5. top row non-corner
    if cornval == 0 and top == True: return 5
    # 6. left column non-corner
    if cornval == 0 and left == True: return 6
    # 7. bottom row non-corner
    if cornval == 0 and bottom == True: return 7
    # 8. right column non-corner
    if cornval == 0 and right == True: return 8
    return 0
    
def populate_reds(top,bottom,puz):
    fill_red_top_th = top
    fill_red_bottom_th = bottom
    #generate random red dots
    #find amount of red dots to fill
    red_dot_num = rand.randint(round(((n**2)*fill_red_bottom_th)), round(((n**2)*fill_red_top_th)))
    if(debug_level > 3):print(f"The goal red dot count is {red_dot_num}")

    current_red_count = 0
    while current_red_count < red_dot_num:
        x = rand.randint(0,n-1)
        y = rand.randint(0,n-1)
        tileval = puz[x,y]
        if tileval != -1:
            puz[x,y] = -1
            current_red_count = current_red_count + 1
        else:
            pass
    if(debug_level > 3):print(f"The current red count is {current_red_count}")
    if(debug_level >= 1):print(f"There are {how_many_filled(puzzle)} red dots in the first draft generated puzzle")

    if(debug_level > 3):print("Now going to check for holes to be filled")
    # a hole is any tile that is surrounded on all sides by red dots that it itself is not a red dot
    shapex = puz.shape[0]
    shapey = puz.shape[1]
    for i in range(shapex):
        for z in range(shapey):
            border_stat = border_status(i,z)
            #Top left corner
            if border_stat == 1: puz[i,z] = 99
            #free directions are down and right

            #Top right corner
            if border_stat == 2: puz[i,z] = 88
            #free directions are down and left

            #Bottom left corner
            if border_stat == 3: puz[i,z] = 77
            #free directions are up and right
            
            #Bottom right corner
            if border_stat == 4: puz[i,z] = 66
            #free directions are up and left

            #Top non-corner
            if border_stat == 5: puz[i,z] = 55
            #free directions are left, down, and right

            #Left non-corner
            if border_stat == 6: puz[i,z] = 44
            #free directions are up, right, and down

            #Bottom non-corner
            if border_stat == 7: puz[i,z] = 33
            #free fdirections are left, up, and right

            #Right non-corner
            if border_stat == 8: puz[i,z] = 22
            #free directions are up, left, and down

#Debug - shows blank grid
print_line_break()
print("Blank puzzle generated")
print_puzzle(blank_puzzle)
print_line_break()

populate_reds(0.35,0.2,puzzle)
    
print_puzzle(puzzle)
