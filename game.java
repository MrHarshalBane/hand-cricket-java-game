import java.util.Random;
import java.util.Scanner;

public class CricketGame {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        Random rand = new Random();

        int userScore = 0;
        int compScore = 0;

        System.out.println("----- CRICKET GAME -----");

        
        System.out.println("Toss Time!");
        System.out.println("Choose 1 for Heads or 2 for Tails:");
        int userToss = sc.nextInt();

        int tossResult = rand.nextInt(2) + 1;

        if (userToss == tossResult) {
            System.out.println("You won the toss!");

            System.out.println("Choose: 1 for Batting, 2 for Bowling");
            int decision = sc.nextInt();

            if (decision == 1) {
                System.out.println("You are Batting First");

                for (int i = 1; i <= 6; i++) {
                    System.out.println("Enter runs (1-6): ");
                    int userRun = sc.nextInt();
                    int compBall = rand.nextInt(6) + 1;

                    if (userRun == compBall) {
                        System.out.println("OUT!");
                        break;
                    } else {
                        userScore += userRun;
                        System.out.println("Your score: " + userScore);
                    }
                }

                System.out.println("Computer needs " + (userScore + 1) + " runs");

                while (compScore <= userScore) {
                    System.out.println("Enter ball (1-6): ");
                    int userBall = sc.nextInt();
                    int compRun = rand.nextInt(6) + 1;

                    if (userBall == compRun) {
                        System.out.println("Computer OUT!");
                        break;
                    } else {
                        compScore += compRun;
                        System.out.println("Computer score: " + compScore);
                    }
                }

            } else {
                System.out.println("You are Bowling First");

                while (true) {
                    System.out.println("Enter ball (1-6): ");
                    int userBall = sc.nextInt();
                    int compRun = rand.nextInt(6) + 1;

                    if (userBall == compRun) {
                        System.out.println("Computer OUT!");
                        break;
                    } else {
                        compScore += compRun;
                        System.out.println("Computer score: " + compScore);
                    }
                }

                System.out.println("You need " + (compScore + 1) + " runs");

                while (userScore <= compScore) {
                    System.out.println("Enter runs (1-6): ");
                    int userRun = sc.nextInt();
                    int compBall = rand.nextInt(6) + 1;

                    if (userRun == compBall) {
                        System.out.println("You are OUT!");
                        break;
                    } else {
                        userScore += userRun;
                        System.out.println("Your score: " + userScore);
                    }
                }
            }

        } else {
            System.out.println("Computer won the toss!");
            System.out.println("Computer will Bat First");

            while (true) {
                System.out.println("Enter ball (1-6): ");
                int userBall = sc.nextInt();
                int compRun = rand.nextInt(6) + 1;

                if (userBall == compRun) {
                    System.out.println("Computer OUT!");
                    break;
                } else {
                    compScore += compRun;
                    System.out.println("Computer score: " + compScore);
                }
            }

            System.out.println("You need " + (compScore + 1) + " runs");

            while (userScore <= compScore) {
                System.out.println("Enter runs (1-6): ");
                int userRun = sc.nextInt();
                int compBall = rand.nextInt(6) + 1;

                if (userRun == compBall) {
                    System.out.println("You are OUT!");
                    break;
                } else {
                    userScore += userRun;
                    System.out.println("Your score: " + userScore);
                }
            }
        }

        
        if (userScore > compScore) {
            System.out.println("You Win!");
        } else if (compScore > userScore) {
            System.out.println("Computer Wins!");
        } else {
            System.out.println("Match Draw!");
        }

        sc.close();
    }
}