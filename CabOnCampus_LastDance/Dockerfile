# Stage 1: Build the application JAR
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/CabOnCampus_LastDance-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Execute the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
