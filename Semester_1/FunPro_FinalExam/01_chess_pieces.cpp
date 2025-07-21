#include <iostream>
#include <cmath>
#include <bits/stdc++.h>

using namespace std;

class Piece
{
protected:
	int faction; // Faction is 1 for white and -1 for black
	int x;
	int y;
	char *name;

public:
	void getLocation()
	{
		cout << name << " is at x: " << x << " y: " << y << endl;
	}
	bool moveCondition(int x_dest, int y_dest);
	void move(int x_dest, int y_dest);
};
class Bishop : public Piece
{
public:
	Bishop(int f)
	{ // Constructor is not inherited
		name = (char *)"Bishop";
		faction = f;
		x = 0;
		y = 0;
	}
	bool moveCondition(int x_dest, int y_dest)
	{
		return (((x_dest - x) == (y_dest - y)) && (y_dest - y != 0) && (x_dest - x != 0));
	}
	void move(int x_dest, int y_dest)
	{
		if (moveCondition(x_dest, y_dest))
		{
			x = x_dest;
			y = y_dest;
			getLocation();
		}
		else
		{
			cout << "Invalid movement!!" << endl;
		}
	}
};
class Knight : public Piece
{
public:
	Knight(int f)
	{ // Constructor is not inherited
		name = (char *)"Knight";
		faction = f;
		x = 0;
		y = 0;
	}
	bool moveCondition(int x_dest, int y_dest)
	{
		return ((abs(x_dest - x) == 2) && (abs(y_dest - y) == 1) || (abs(x_dest - x) == 1) && (abs(y_dest - y) == 2));
	}
	void move(int x_dest, int y_dest)
	{
		if (moveCondition(x_dest, y_dest))
		{
			x = x_dest;
			y = y_dest;
			getLocation();
		}
		else
		{
			cout << "Invalid movement!!" << endl;
		}
	}
};
class Pawn : public Piece
{
public:
	Pawn(int f)
	{ // Constructor is not inherited
		name = (char *)"Pawn";
		faction = f;
		x = 0;
		y = 0;
	}
	bool moveCondition(int x_dest, int y_dest)
	{
		return ((x_dest == x) && ((y_dest - y) == (1 * faction)));
	}
	void move(int x_dest, int y_dest)
	{
		if (moveCondition(x_dest, y_dest))
		{
			x = x_dest;
			y = y_dest;
			getLocation();
		}
		else
		{
			cout << "Invalid movement!!" << endl;
		}
	}
};
class Queen : public Piece
{
public:
	Queen(int f)
	{ // Constructor is not inherited
		name = (char *)"Queen";
		faction = f;
		x = 0;
		y = 0;
	}
	bool moveCondition(int x_dest, int y_dest)
	{
		return ((abs(x_dest - x) == abs(y_dest - y)) && ((y_dest - y != 0) && (x_dest - x != 0)) || ((x_dest != x) ^ (y_dest != y)));
	}
	void move(int x_dest, int y_dest)
	{
		if (moveCondition(x_dest, y_dest))
		{
			x = x_dest;
			y = y_dest;
			getLocation();
		}
		else
		{
			cout << "Invalid movement!!" << endl;
		}
	}
};
class Rook : public Piece
{
public:
	Rook(int f)
	{ // Constructor is not inherited
		name = (char *)"Rook";
		faction = f;
		x = 0;
		y = 0;
	}
	bool moveCondition(int x_dest, int y_dest)
	{
		return ((x_dest != x) ^ (y_dest != y));
	}
	void move(int x_dest, int y_dest)
	{
		if (moveCondition(x_dest, y_dest))
		{
			x = x_dest;
			y = y_dest;
			getLocation();
		}
		else
		{
			cout << "Invalid movement!!" << endl;
		}
	}
};
int main()
{
	int x, y, z;
	string bishop = "b";
	string knight = "k";
	string pawn = "p";
	string queen = "q";
	string rook = "r";
	string chesspiece;

	cout << "b: Bishop\nk: Knight\np: Pawn\nq: Queen\nr: Rook\n";
	cout << "Choose the chess piece:\n";
	cin >> chesspiece;

	cout << "Choose the faction you prefer (1 or -1):\n";
	cin >> z;

	if (chesspiece == bishop)
	{
		Bishop test(z);
		cout << "Destination (x, y):\n";
		cin >> x;
		cin >> y;
		test.move(x, y);
	}
	else if (chesspiece == knight)
	{
		Knight test(z);
		cout << "Destination (x, y):\n";
		cin >> x;
		cin >> y;
		test.move(x, y);
	}
	else if (chesspiece == pawn)
	{
		Pawn test(z);
		cout << "Destination (x, y):\n";
		cin >> x;
		cin >> y;
		test.move(x, y);
	}
	else if (chesspiece == queen)
	{
		Queen test(z);
		cout << "Destination (x, y):\n";
		cin >> x;
		cin >> y;
		test.move(x, y);
	}
	else
	{
		Rook test(z);
		cout << "Destination (x, y):\n";
		cin >> x;
		cin >> y;
		test.move(x, y);
	}

	return 0;
}