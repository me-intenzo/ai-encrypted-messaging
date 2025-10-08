# Contributing to SecureChat AI

## Development Setup

1. **Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

2. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Code Style

- **Python**: Follow PEP 8
- **TypeScript**: Use ESLint config
- **Commits**: Use conventional commits (feat:, fix:, docs:)

## Pull Requests

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'feat: add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## Testing

- Test all API endpoints before submitting
- Verify UI changes on mobile and desktop
- Check AI classification accuracy

## Questions?

Open an issue for discussion.
