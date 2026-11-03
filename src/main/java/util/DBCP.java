package util;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBCP {
	private static DBCP dbcp;
	private DBCP() {
		try {
			Class.forName("oracle.jdbc.OracleDriver");
		} catch (ClassNotFoundException e) {			
			throw new RuntimeException("oracle driver check");
		} 
		System.out.println("1 driver loading ok");
	}
	public static Connection getConnection() throws SQLException {
		if(dbcp ==null) dbcp=new DBCP();
		String url = "jdbc:oracle:thin:@211.108.241.157:51522:xe";
		return DriverManager.getConnection(url, "hr", "hr");
	}
}
