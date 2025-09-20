import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
            if (!session || session.user.role !== "admin") {
                  return NextResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 403 }
                  );
                }
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    //Gets the page query parameter and parses it as an integer. Defaults to 1 if not provided.
    /* 10-It's the numeral system base.10 means decimal (base 10) — the number system we normally use (0–9).Without it, parseInt() can behave unexpectedly, especially with strings that start with 0. Always include the radix (usually 10) when using parseInt() to avoid bugs.*/
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const query = searchParams.get("query") || "";

    /* If query exists, it searches the email field using a case-insensitive regex.If query is empty, it returns all users (no filter). it's for search. $regex is a MongoDB operator that matches strings using regular expressions.
In here, it searches the email field for matches to query.What does $options: "i" mean?
$options is used to modify the behavior of the regex."i" stands for "ignore case".So:{ email: { $regex: "john", $options: "i" } }Will match: John@example.com, JOHN@domain.com, joHn123@gmail.com.Even though the cases are different. Without "i" (case-sensitive):{ email: { $regex: "john" } } Will only match: john@example.comNot: John@example.com,JOHN@example.com*/
    const filter = query
      ? { email: { $regex: query, $options: "i" } }
      : {};
// Counts the total number of users that match the filter. This helps in pagination (to calculate total pages).
// countDocuments() returns the number of documents in a MongoDB collection that match a given filter/query.
    const totalUsers = await User.countDocuments(filter);
    /* .skip and .limit are used for pagination. To paginate results — i.e., return only a specific “page” of results from the database instead of all documents at once..skip() – How many results to skip.skip((page - 1) * limit). This tells MongoDB how many documents to skip before starting to return results. It calculates the offset based on the current page number. Formula:(page - 1) * limit
Page	Skip
1	(1 - 1) × 10 = 0
2	(2 - 1) × 10 = 10
3	(3 - 1) × 10 = 20
So, if you're on page 3 and limit is 10:It skips the first 20 documents and returns the next 10.
.limit(limit) – Max results to return. This limits the number of documents returned in the query.It ensures that only limit number of results are returned.For example:.limit(10).Means: return only 10 documents after skipping the required number.
Full Example: Let’s say you have 100 users and you want page 3 with a limit of 10 users per page:
.skip((3 - 1) * 10) // → .skip(20)
.limit(10)
MongoDB will:Skip the first 20 users. Return users 21 to 30.
Summary:
.skip(n)	Skips n documents — used to reach the correct page
.limit(n)	Returns only n documents — used to control page size */
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true,
      message: "Successfully fetched users",
    data: {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    }
    }, { status: 200 });
  } catch (error: any) {
    console.error("admin dashboard users tab error", error);
    return NextResponse.json({success: false, error}, { status: 500 });
  }
}


// delete user
export async function DELETE(request: NextRequest) {
  try {
     const session = await getServerSession(authOptions);
            if (!session || session.user.role !== "admin") {
                  return NextResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 403 }
                  );
                }
    await connectToDatabase();
    const { _id } = await request.json();
    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("admin dashboard delete user error", error);
    return NextResponse.json({success: false, error}, { status: 500 });
  }
}