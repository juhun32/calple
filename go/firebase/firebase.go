package firebase

import (
	"context"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

// initialize firebase/firestore client
func InitFirebase(ctx context.Context) (*firestore.Client, error) {
	credFile := "firebase_credentials.json"

	if content := os.Getenv("FIREBASE_CREDENTIALS_JSON"); content != "" {
		if err := os.WriteFile(credFile, []byte(content), 0600); err != nil {
			return nil, err
		}
	}

	opt := option.WithCredentialsFile(credFile)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, err
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, err
	}

	return client, nil
}
